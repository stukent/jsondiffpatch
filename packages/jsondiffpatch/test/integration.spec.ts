/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as crypto from 'crypto';
import * as jsondiffpatch from '../src/index.js';

export function getItemId(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null
  if ('$id' in obj && typeof obj.$id === 'string') return obj.$id
  if ('id' in obj && typeof obj.id === 'string') return obj.id
  if ('key' in obj && typeof obj.key === 'string') return obj.key

  return null
}

let instance: jsondiffpatch.DiffPatcher;
beforeAll(function () {
  instance = jsondiffpatch.create({
    objectHash(obj: Record<string, any>) {
      const itemId = getItemId(obj)
      if (itemId) return itemId

      // This is probably inefficient, but the only time we are creating diffs is inside the recorder,
      // so we can afford for that to be slow in the name of speeding everything else up.
      const sortedKeys = Object.keys(obj).sort()
      const sortedObj: Record<string, any> = {}
      for (const key of sortedKeys) {
        const value = obj[key]
        // We only want shallow keys to generate the hash with.
        if (value && typeof value === 'object') continue
        if (value && Array.isArray(value)) continue
        sortedObj[key] = obj[key]
      }
      return crypto.createHash('sha256').update(JSON.stringify(sortedObj)).digest('hex')
    },
    arrays: {
      detectMove: true,
      includeValueOnMove: true,
    },
    cloneDiffValues: true,
  })
});

it('patches and unpatches array elements being created', () => {
  const before = {
    $localState: {
      lastSerializedSelection: {
        indexPaths: [[24]],
      }
    }
  }
  const after = {
    $localState: {
      lastSerializedSelection: {
        indexPaths: [[27]],
      }
    }
  }
  const diff = instance.diff(before, after)
  console.info(JSON.stringify(diff, null, 2))
  const patched = instance.patch(JSON.parse(JSON.stringify(before)), diff)
  expect(patched).toEqual(after)

  const unpatched = instance.unpatch(patched, diff)
  expect(unpatched).toEqual(before)
  console.info(unpatched)

  const otherAfter = {
    $localState: {
      lastSerializedSelection: {
        anchor: { foo: 'bar' },
        other: { foo: 'far' },
        type: 'RangeSelection',
      }
    }
  }
  const otherUnpatched = instance.unpatch(otherAfter, diff)
  expect(otherUnpatched).toEqual({
    $localState: {
      lastSerializedSelection: {
        anchor: { foo: 'bar' },
        other: { foo: 'far' },
        type: 'RangeSelection',
        indexPaths: [[24]],
      }
    }
  })
  console.info(otherUnpatched)
})
