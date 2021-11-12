import React, { useContext, useEffect } from 'react'
import { PencilAltIcon, TrashIcon } from '@heroicons/react/solid'
import { useQuery, gql, useMutation } from '@apollo/client'
import AuthContext from '../utils/authContext'
import * as yup from 'yup'
import { Formik } from 'formik'
import { Link } from 'gatsby'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
const GET_ALL_BOOKMARKS = gql`
  query {
    getBookmarks {
      id
      title
      url
    }
  }
`
const ADD_BOOKMARK = gql`
  mutation ($title: String!, $url: String!) {
    addBookmark(title: $title, url: $url) {
      title
      url
    }
  }
`

const UPDATE_BOOKMARK = gql`
  mutation ($id: ID!, $title: String!, $url: String!) {
    updateBookmark(id: $id, title: $title, url: $url) {
      title
    }
  }
`

const DELETE_BOOKMARK = gql`
  mutation ($id: ID!) {
    deleteBookmark(id: $id) {
      title
      url
    }
  }
`

type bookmarkprops = {
  url: string
  title: string
  id: string
  userid: string
}

const index = () => {
  const { user } = useContext(AuthContext)
  const { loading, refetch, error, data, called } = useQuery(GET_ALL_BOOKMARKS)
  const [addBookmark, { loading: addloading }] = useMutation(ADD_BOOKMARK, {
    refetchQueries: [{ query: GET_ALL_BOOKMARKS }],
  })
  const [updateBookmark, { loading: updateloading }] = useMutation(
    UPDATE_BOOKMARK,
    {
      refetchQueries: [{ query: GET_ALL_BOOKMARKS }],
    }
  )
  const [deleteBookmark, { loading: deleteloading }] = useMutation(
    DELETE_BOOKMARK,
    {
      refetchQueries: [{ query: GET_ALL_BOOKMARKS }],
    }
  )

  useEffect(() => {
    refetch()
    console.log('UseEffect is called')
  }, [user])

  if (loading || addloading || updateloading || deleteloading) {
    return (
      <div className=' min-h-screen flex justify-center items-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500'></div>
      </div>
    )
  }
  if (error) {
    console.log(error)
    return <h1>Error...</h1>
  }
  console.log(data)
  const validationSchema = yup.object().shape({
    title: yup.string().required('*Enter Bookmark Title'),
    url: yup
      .string()
      .required('Enter Bookmark url')
      .matches(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Enter a correct url'
      ),
  })

  const deletefunction = async (id: string) => {
    try {
      await deleteBookmark({ variables: { id } })
      toast.error('Bookmark DELETED')
    } catch (error) {
      console.log(error)
    }
  }

  const editfunction = async (id: string) => {
    const result = await Swal.fire({
      title: 'Enter Bookmark',
      html: `<input type="text" id="title" class="swal2-input" placeholder="Title">
  <input type="url" id="url" class="swal2-input" placeholder="URL">`,
      confirmButtonText: 'Update Bookmark',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        //@ts-ignore
        const title = Swal.getPopup().querySelector('#title').value
        //@ts-ignore
        const url = Swal.getPopup().querySelector('#url').value
        if (!title || !url) {
          Swal.showValidationMessage(`Please enter Title and Url`)
        }
        return { title: title, url: url }
      },
    })
    if (result?.value?.title) {
      console.log(result?.value?.title)
      console.log(result?.value?.url)
      await updateBookmark({
        variables: {
          id: id,
          title: result?.value?.title,
          url: result?.value?.url,
        },
      })
      toast.success('Bookmark UPDATED')
    }
  }

  return (
    <div>
      <div className='w-screen grid place-items-center '>
        <Formik
          initialValues={{
            title: '',
            url: '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            console.log(values)
            try {
              await addBookmark({
                variables: {
                  title: values.title,
                  url: values.url,
                },
              })
              toast.success('Bookmark ADDED')
            } catch (error) {
              console.log(error)
              toast.error(error.message)
            }
          }}
        >
          {({
            errors,

            touched,

            handleChange,

            handleBlur,

            handleSubmit,

            isSubmitting,
          }) => (
            <div className='w-screen max-w-4xl '>
              <form className='space-y-6 ' onSubmit={handleSubmit}>
                <div className=''>
                  <label
                    htmlFor='text'
                    className={`${
                      errors.title && touched.title && errors.title
                        ? 'text-red-500 '
                        : 'text-black '
                    }  text-sm font-medium `}
                  >
                    Title
                  </label>
                  <div className='mt-1'>
                    <input
                      onChange={handleChange}
                      onBlur={handleBlur}
                      id='title'
                      name='title'
                      type='text'
                      required
                      className={`${
                        errors.title && touched.title && errors.title
                          ? 'border-2 border-red-500  focus:ring-red-500 '
                          : 'border-2 focus:border-indigo-500  focus:ring-indigo-500 '
                      } appearance-none block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none  sm:text-sm bg-gray-100 focus:bg-white `}
                    />
                  </div>
                  <span className=' text-red-500'>
                    {errors.title && touched.title && errors.title}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor='text'
                    className={`${
                      errors.url && touched.url && errors.url
                        ? 'text-red-500 '
                        : 'text-black'
                    }  text-sm font-medium `}
                  >
                    URL
                  </label>
                  <div className='mt-1  '>
                    <textarea
                      onChange={handleChange}
                      onBlur={handleBlur}
                      id='url'
                      name='url'
                      required
                      className={`${
                        errors.url && touched.url && errors.url
                          ? 'border-2 border-red-500 border-opacity-100 focus:ring-red-500 '
                          : 'border-2 focus:border-indigo-500 border-opacity-100 focus:ring-indigo-500 '
                      } appearance-none block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none  sm:text-sm bg-gray-100 focus:bg-white`}
                    />
                  </div>
                  <span className=' text-red-500'>
                    {errors.url && touched.url && errors.url}
                  </span>
                </div>

                <div className='flex justify-center '>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-1/2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  >
                    {isSubmitting ? 'Loading...' : 'ADD Bookmark'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </div>
      <div className='bg-white pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8'>
        <div className='relative max-w-lg mx-auto divide-y divide-gray-200 lg:max-w-7xl'>
          <div>
            <h2 className='text-3xl tracking-tight font-extrabold text-gray-500 sm:text-4xl'>
              Bookmarks:
            </h2>
          </div>
          <div className='mt-12 grid gap-16 pt-12 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12'>
            {data?.getBookmarks?.map((bookmark: bookmarkprops) => (
              <div key={bookmark?.id}>
                <div className='flex flex-col items-center mt-4'>
                  <p className='text-xl font-semibold text-gray-900'>
                    {bookmark?.title}
                  </p>
                  <a
                    href={bookmark?.url}
                    className='mt-3 text-base text-gray-500'
                  >
                    {bookmark?.url}
                  </a>
                </div>
                <div>
                  <div className='flex justify-evenly mt-4 '>
                    <div className='text-blue-600'>
                      <button
                        className=' flex items-center justify-center px-4 py-2 border-2 border-blue-500 border-opacity-100 rounded-md transition duration-500  text-base font-medium  bg-white hover:bg-blue-700 hover:text-white shadow-lg'
                        onClick={() => editfunction(bookmark.id)}
                      >
                        <PencilAltIcon className='w-5 h-5' aria-hidden='true' />
                        <span className=''>Edit</span>
                      </button>
                    </div>
                    <div className='border-l-2 border-gray-300  ' />
                    <div className=' text-red-600 '>
                      <button
                        className='  flex items-center justify-center px-4 py-2 border-2 border-red-500 border-opacity-100 rounded-md transition duration-500  text-base font-medium  bg-white hover:bg-red-700 hover:text-white shadow-lg'
                        onClick={() => deletefunction(bookmark.id)}
                      >
                        <TrashIcon className='w-5 h-5 ' aria-hidden='true' />
                        <span className=''>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default index
