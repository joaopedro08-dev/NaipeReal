export const sameSecret = (expected: string, received: string): boolean => {
  let difference = expected.length ^ received.length
  for (let index = 0; index < expected.length; index++) {
    difference |= expected.charCodeAt(index) ^ received.charCodeAt(index % (received.length || 1))
  }
  return difference === 0
}
