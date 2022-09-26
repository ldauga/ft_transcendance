import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function DropZone(props: {setUserParameterNewProfilePicture: any}) {
	const onDrop = useCallback((acceptedFiles: any[]) => {
	  acceptedFiles.forEach((file) => {
		if (file.type.split('/')[0] != 'image')
			return

			props.setUserParameterNewProfilePicture(file)
	  })
	  
	}, [])

	const {getRootProps, getInputProps} = useDropzone({onDrop})
  
	return (
	  <div {...getRootProps({ className: "dropzone" })}>
		<input {...getInputProps()} />
		<p>Drag 'n' drop some files here, or click to select files</p>
	  </div>
	)
  }