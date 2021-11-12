const { ApolloServer, gql } = require('apollo-server-lambda')
const faunadb = require('faunadb')

const client = new faunadb.Client({
  secret: process.env.GATSBY_FaunaDB_Secret_Key,
})

const q = faunadb.query

const typeDefs = gql`
  type Query {
    getBookmarks: [Bookmark]!
  }
  type Bookmark {
    id: ID!
    title: String!
    url: String!
    userid: String!
  }

  type Mutation {
    addBookmark(title: String!, url: String!): Bookmark
    updateBookmark(title: String!, url: String!, id: ID!): Bookmark
    deleteBookmark(id: ID!): Bookmark
  }
`

const resolvers = {
  Query: {
    getBookmarks: async (parent, args, { user }) => {
      console.log('USER ID>>>>>>:', user)
      if (!user) return []

      try {
        const results = await client.query(
          q.Paginate(q.Match(q.Index('userid'), user))
        )
        return results.data.map(([ref, title, url]) => ({
          id: ref.id,
          title,
          url,
          userid: user,
        }))
      } catch (error) {
        console.log(error)
      }
    },
  },
  Mutation: {
    addBookmark: async (_, { title, url }, { user }) => {
      console.log('USER ID>>>>>>:', user)
      if (!user) {
        throw new Error('Must be authenticated to insert Bookmarks')
      }
      try {
        const result = await client.query(
          q.Create(q.Collection('bookmarks'), {
            data: {
              title: title,
              url: url,
              userid: user,
            },
          })
        )
        console.log(result)
        return {
          title: result.data.title,
          url: result.data.url,
          id: result.ref.id,
        }
      } catch (err) {
        console.log(err)
      }
    },
    updateBookmark: async (_, { title, url, id }, { user }) => {
      console.log('id: ', id)

      if (!user) {
        throw new Error('Must be authenticated to Update todos')
      }
      try {
        const result = await client.query(
          q.Update(q.Ref(q.Collection('bookmarks'), id), {
            data: {
              title: title,
              url: url,
            },
          })
        )

        console.log(result)
        return {
          ...result.data,
          id: result.ref.id,
        }
      } catch (error) {
        console.log(error)
      }
    },
    deleteBookmark: async (_, { id }) => {
      console.log('id: ', id)

      try {
        const result = await client.query(
          q.Delete(q.Ref(q.Collection('bookmarks'), id))
        )

        console.log(result)
        return result.data
      } catch (error) {
        console.log('ERROR:::>>>', error.description)
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ context }) => {
    if (context.clientContext.user) {
      return {
        user: context.clientContext.user.sub,
      }
    } else {
      return { user: null }
    }
  },
  playground: true,
  introspection: true,
})

const handler = server.createHandler()

module.exports = { handler }
