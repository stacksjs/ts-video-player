import { describe, expect, test } from 'bun:test'
import { EventEmitter } from '../../src/core/events'

// =============================================================================
// EventEmitter
// =============================================================================

interface TestEventMap {
  [key: string]: (...args: any[]) => void
  foo: (value: number) => void
  bar: (a: string, b: boolean) => void
  baz: () => void
}

describe('EventEmitter', () => {
  test('on + emit calls handler', () => {
    const emitter = new EventEmitter<TestEventMap>()
    let received: number | null = null
    emitter.on('foo', (v) => { received = v })
    emitter.emit('foo', 42)
    expect(received).toBe(42)
  })

  test('emit with multiple args', () => {
    const emitter = new EventEmitter<TestEventMap>()
    let a: string = ''
    let b: boolean = false
    emitter.on('bar', (x, y) => { a = x; b = y })
    emitter.emit('bar', 'hello', true)
    expect(a).toBe('hello')
    expect(b).toBe(true)
  })

  test('multiple listeners', () => {
    const emitter = new EventEmitter<TestEventMap>()
    let count = 0
    emitter.on('baz', () => count++)
    emitter.on('baz', () => count++)
    emitter.emit('baz')
    expect(count).toBe(2)
  })

  test('off removes listener', () => {
    const emitter = new EventEmitter<TestEventMap>()
    let count = 0
    const handler = () => { count++ }
    emitter.on('baz', handler)
    emitter.emit('baz')
    expect(count).toBe(1)
    emitter.off('baz', handler)
    emitter.emit('baz')
    expect(count).toBe(1)
  })

  test('once fires only once', () => {
    const emitter = new EventEmitter<TestEventMap>()
    let count = 0
    emitter.once('baz', () => { count++ })
    emitter.emit('baz')
    emitter.emit('baz')
    expect(count).toBe(1)
  })

  test('removeAllListeners clears all', () => {
    const emitter = new EventEmitter<TestEventMap>()
    let count = 0
    emitter.on('foo', () => count++)
    emitter.on('bar', () => count++)
    emitter.removeAllListeners()
    emitter.emit('foo', 1)
    emitter.emit('bar', '', false)
    expect(count).toBe(0)
  })

  test('error in handler is caught and logged', () => {
    const emitter = new EventEmitter<TestEventMap>()
    // The EventEmitter catches errors in handlers and logs them
    // This should not throw
    emitter.on('baz', () => { throw new Error('test error') })
    // Suppress console.error output in test
    const orig = console.error
    console.error = () => {}
    emitter.emit('baz')
    console.error = orig
  })

  test('emit with no listeners does not throw', () => {
    const emitter = new EventEmitter<TestEventMap>()
    expect(() => emitter.emit('baz')).not.toThrow()
  })
})
