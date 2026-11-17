// NEW FILE
// Shows when someone goes to an address that doesn't exist.

import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>
        That page doesn&apos;t exist. <Link to="/">Go back home</Link>.
      </p>
    </section>
  )
}

export default NotFoundPage
