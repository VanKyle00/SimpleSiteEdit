import { parse } from '@babel/parser'
import type { Node, ObjectExpression, ArrayExpression } from '@babel/types'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export function explode(srcPath: string, shadowRoot: string): void {
  const source = readFileSync(srcPath, 'utf8')
  const literals = parseLiterals(source)
  for (const [name, entries] of literals) {
    const dir = join(shadowRoot, name)
    mkdirSync(dir, { recursive: true })
    entries.forEach((entry, i) => {
      const filename = String(i + 1).padStart(4, '0') + '.json'
      writeFileSync(join(dir, filename), JSON.stringify(entry, null, 2) + '\n')
    })
  }
}

export function parseLiterals(source: string): Map<string, unknown[]> {
  const ast = parse(source, { sourceType: 'module', plugins: [] })
  const result = new Map<string, unknown[]>()

  for (const stmt of ast.program.body) {
    if (stmt.type !== 'VariableDeclaration') continue
    if (stmt.kind !== 'const') continue
    for (const decl of stmt.declarations) {
      if (decl.id.type !== 'Identifier') continue
      if (!decl.init || decl.init.type !== 'ArrayExpression') continue
      const value = astArrayValue(decl.init)
      if (value === undefined) continue
      result.set(decl.id.name, value)
    }
  }

  return result
}

function astArrayValue(node: ArrayExpression): unknown[] | undefined {
  const out: unknown[] = []
  for (const el of node.elements) {
    if (el === null) {
      out.push(null)
      continue
    }
    const v = astValueOf(el)
    if (v === SKIP) return undefined
    out.push(v)
  }
  return out
}

const SKIP = Symbol('SKIP')

function astValueOf(node: Node): unknown {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value
    case 'NullLiteral':
      return null
    case 'ArrayExpression':
      return astArrayValue(node)
    case 'ObjectExpression':
      return astObjectValue(node)
    default:
      return SKIP
  }
}

function astObjectValue(node: ObjectExpression): Record<string, unknown> | typeof SKIP {
  const out: Record<string, unknown> = {}
  for (const prop of node.properties) {
    if (prop.type !== 'ObjectProperty') return SKIP
    if (prop.computed) return SKIP
    let key: string
    if (prop.key.type === 'Identifier') key = prop.key.name
    else if (prop.key.type === 'StringLiteral') key = prop.key.value
    else return SKIP
    const value = astValueOf(prop.value as Node)
    if (value === SKIP) return SKIP
    out[key] = value
  }
  return out
}
