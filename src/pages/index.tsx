import React, { useContext, useEffect } from 'react'
import { useQuery, gql, useMutation } from '@apollo/client'
import AuthContext from '../utils/authContext'
const GET_ALL_BOOKMARKS = gql`
  query {
    getBookmarks {
      id
      title
      url
    }
  }
`

const index = () => {
  const { user } = useContext(AuthContext)
  const { loading, refetch, error, data } = useQuery(GET_ALL_BOOKMARKS)
  useEffect(() => {
    refetch()
    console.log('UseEffect is called')
  }, [user])

  if (
    loading
    //  ||
    //  addloading ||
    //  updateloading ||
    //  updateCompletedloading ||
    //  deleteloading
  ) {
    return <h1>Loading...</h1>
  }
  if (error) {
    console.log(error)
    return <h1>Error...</h1>
  }
  console.log(data)
  let name: HTMLInputElement | null
  return <div>Home page</div>
}

export default index
