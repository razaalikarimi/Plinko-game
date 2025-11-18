import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  const message =
    error?.status === 404
      ? 'The page you are looking for does not exist.'
      : error?.statusText || error?.message || 'Something went wrong.';

  return (
    <div className="panel error-panel">
      <h1>Oops!</h1>
      <p>{message}</p>
      <Link to="/" className="primary">
        Back to drops
      </Link>
    </div>
  );
}

