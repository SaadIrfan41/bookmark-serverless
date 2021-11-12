import React from 'react'
import Layout from './src/components/Layout'
import { AuthContextProvider } from './src/utils/authContext'
import { ApolloProvider } from '@apollo/client'
import { client } from './src/utils/apollo'
export function wrapPageElement({ element, props }) {
  return (
    <ApolloProvider client={client}>
      <AuthContextProvider>
        <Layout {...props}>{element}</Layout>
      </AuthContextProvider>
    </ApolloProvider>
  )
}
