let current = 0

export default function generateId (prefix) {
  return `${prefix || 'id'}-${current++}`
}
