import React from 'react';

function Puid({value}) {
  return (
    <a href={`http://www.nationalarchives.gov.uk/pronom/${value}`} target="_blank">{value}</a>
  )
}

export default Puid;