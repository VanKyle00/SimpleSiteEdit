import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import * as recast from 'recast'
import * as parser from 'recast/parsers/babel.js'

export function inject(srcPath: string, shadowRoot: string, outPath: string): void {
  const source = readFileSync(srcPath, 'utf8')
  const lineTerminator = source.includes('\r\n') ? '\r\n' : '\n'
  const ast = recast.parse(source, { parser })

  for (const stmt of ast.program.body) {
    if (stmt.type !== 'VariableDeclaration') continue
    if (stmt.kind !== 'const') continue
    for (const decl of stmt.declarations) {
      if (decl.id.type !== 'Identifier') continue
      if (!decl.init || decl.init.type !== 'ArrayExpression') continue
      const name = decl.id.name
      const dir = join(shadowRoot, name)
      if (!existsSync(dir) || !statSync(dir).isDirectory()) continue

      const shadowEntries = readShadowEntries(dir)
      const currentEntries = arrayExprToValues(decl.init)
      if (deepEqual(shadowEntries, currentEntries)) continue

      decl.init = valuesToArrayExpr(shadowEntries)
    }
  }

  const output = recast.print(ast, { lineTerminator }).code
  writeFileSync(outPath, output)
}

function readShadowEntries(dir: string): unknown[] {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  return files.map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
}

function arrayExprToValues(node: any): unknown[] {
  return node.elements.map((el: any) => nodeToValue(el))
}

function nodeToValue(node: any): unknown {
  if (node === null) return null
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value
    case 'NullLiteral':
      return null
    case 'ArrayExpression':
      return arrayExprToValues(node)
    case 'ObjectExpression': {
      const obj: Record<string, unknown> = {}
      for (const prop of node.properties) {
        if (prop.type !== 'ObjectProperty') continue
        const key =
          prop.key.type === 'Identifier'
            ? prop.key.name
            : prop.key.type === 'StringLiteral'
              ? prop.key.value
              : null
        if (key === null) continue
        obj[key] = nodeToValue(prop.value)
      }
      return obj
    }
    default:
      return undefined
  }
}

function valuesToArrayExpr(values: unknown[]): any {
  const b = recast.types.builders
  return b.arrayExpression(values.map((v) => valueToNode(v)))
}

function valueToNode(v: unknown): any {
  const b = recast.types.builders
  if (v === null) return b.nullLiteral()
  if (typeof v === 'string') return b.stringLiteral(v)
  if (typeof v === 'number') return b.numericLiteral(v)
  if (typeof v === 'boolean') return b.booleanLiteral(v)
  if (Array.isArray(v)) return b.arrayExpression(v.map(valueToNode))
  if (typeof v === 'object') {
    const props = Object.entries(v as Record<string, unknown>).map(([k, val]) =>
      b.objectProperty(b.identifier(k), valueToNode(val)),
    )
    return b.objectExpression(props)
  }
  throw new Error(`Cannot serialize value of type ${typeof v}: ${String(v)}`)
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== typeof b) return false
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    return a.every((v, i) => deepEqual(v, b[i]))
  }
  if (typeof a === 'object') {
    const ak = Object.keys(a as object).sort()
    const bk = Object.keys(b as object).sort()
    if (ak.length !== bk.length) return false
    if (!ak.every((k, i) => k === bk[i])) return false
    return ak.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
    )
  }
  return false
}
