import './src/styles/global.css'
import 'react-toastify/dist/ReactToastify.css'
import React from 'react'
import Layout from './src/components/Layout'
import { AuthContextProvider } from './src/utils/authContext'
import { ApolloProvider } from '@apollo/client'
import { client } from './src/utils/apollo'
import { ToastContainer } from 'react-toastify'
export function wrapPageElement({ element, props }) {
  return (
    <ApolloProvider client={client}>
      <AuthContextProvider>
        <Layout {...props}>{element}</Layout>
        <ToastContainer
          position='top-right'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthContextProvider>
    </ApolloProvider>
  )
}
