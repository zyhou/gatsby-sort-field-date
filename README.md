# gatsby-starter-blog

[[V2] Bug with setFieldsOnGraphQLNodeType and sort fields - MarkdownRemark on Gatsby](https://github.com/gatsbyjs/gatsby/issues/7274)

- npm i
- npm run develop
- Go to graphiQL (http://localhost:8000/___graphql)
- Copy this query
```js
{
            allMarkdownRemark(sort: { fields: [date], order: DESC }, limit: 1000) {
              edges {
                node {
                  date
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                    date
                  }
                }
              }
            }
          }
          ```
          
You can see the result isn't filter by `date`
