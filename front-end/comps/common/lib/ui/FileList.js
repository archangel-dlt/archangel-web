import React from 'react';
import ReactDataGrid from 'react-data-grid';
import FileSizeFormatter from './formatter/FileSize';
import PuidFormatter from './formatter/Puid';

function FileList({files, showPath}) {
  if (!files || !files.length)
    return null;

  const columns = [
    { key: 'type', name: 'Type', resizable: true },
    { key: 'puid', name: 'Puid', resizable: true, formatter: PuidFormatter },
    { key: 'sha256_hash', name: 'Hash', resizable: true },
    { key: 'size', name: 'Size', resizable: true, formatter: FileSizeFormatter },
    { key: 'last_modified', name: 'Last Modified', resizable: true }
  ];

  if (showPath) {
    columns.unshift(
      { key: 'path', name: 'Path', resizable: true },
      { key: 'name', name: 'File name', resizable: true },
    )
  }

  const size = files.length > 5 ? 500 : 200;

  return (
    <ReactDataGrid
      columns={columns}
      rowGetter={i => files[i]}
      rowsCount={files.length}
      minHeight={size} />
  );
} // FileList

export default FileList;
