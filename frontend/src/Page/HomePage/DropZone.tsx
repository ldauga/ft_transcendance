import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function DropZone(props: { setUserParameterNewProfilePicture: any }) {
	const [message, setMessage] = useState('Drop some files here, or click to select files')
	const [preview, setPreview] = useState("")

	const onDrop = useCallback((acceptedFiles: any[]) => {
		acceptedFiles.forEach((file) => {
			if (file.type.split('/')[0] != 'image')
				setMessage('File must be an image...')


			const objectUrl = URL.createObjectURL(file)
			setPreview(objectUrl)

			props.setUserParameterNewProfilePicture(file)
		})

	}, [])

	const { getRootProps, getInputProps } = useDropzone({ onDrop })

	if (preview == "")
		return (
			<div {...getRootProps({ className: "dropzone" })}>
				<input {...getInputProps()} />
				<p>{message}</p>
			</div>
		)
	else
		return (
			<>
				<div className="user-parameter-content-text">Choose this pic ?</div>
				<div className="user-parameter-preview-new-profile-pic">
					<img src={preview} />
				</div>
			</>
		)

}