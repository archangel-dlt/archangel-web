import React from 'react';

function HashLink({hash, searchFn}) {
  return (
    <button onClick={() => searchFn(hash)} className="btn btn-link" role="link" type="submit">{hash}</button>
  )
}

export default HashLink;