import React from 'react';

function Puid({fmt}) {
  return (
    <a href={`http://www.nationalarchives.gov.uk/pronom/${fmt}`} target="_blank">{fmt}</a>
  )
}

export default Puid;