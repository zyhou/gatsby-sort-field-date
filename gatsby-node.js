const _ = require('lodash')
const Promise = require('bluebird')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const { GraphQLString } = require('graphql')

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve('./src/templates/blog-post.js')
    resolve(
      graphql(
        `
          {
            allMarkdownRemark(
              sort: { fields: [date], order: DESC }
              limit: 1000
            ) {
              edges {
                node {
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create blog posts pages.
        const posts = result.data.allMarkdownRemark.edges

        _.each(posts, (post, index) => {
          const previous =
            index === posts.length - 1 ? null : posts[index + 1].node
          const next = index === 0 ? null : posts[index - 1].node

          createPage({
            path: post.node.fields.slug,
            component: blogPost,
            context: {
              slug: post.node.fields.slug,
              previous,
              next,
            },
          })
        })
      })
    )
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

const extractDataFromFilename = filename => {
  const basename = path.basename(filename)
  const match = basename.match(/^(\d{4})-(\d{2})-(\d{2})-(.*?)\.(md|markdown)$/)
  if (!match) {
    return null
  }
  const [, year, month, day, name] = match

  return {
    year,
    month,
    day,
    name,
  }
}

exports.setFieldsOnGraphQLNodeType = ({ type }) => {
  if (type.name !== 'MarkdownRemark') {
    return {}
  }

  return Promise.resolve({
    date: {
      type: GraphQLString,
      resolve: node => {
        const data = extractDataFromFilename(node.fileAbsolutePath)

        if (!data) {
          return null
        }

        const { year, month, day } = data

        return `${year}-${month}-${day}T12:00:00.000Z`
      },
    },
  })
}
