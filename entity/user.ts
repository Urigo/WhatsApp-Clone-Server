export interface User {
  id: string
  username: string
  password: string
  name: string
  picture?: string | null
  phone?: string | null
}

export default User
