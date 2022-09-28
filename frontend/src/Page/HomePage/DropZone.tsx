import React, { useCallback, useState } from "react";

var preview: string = ""

export default function DropZone(props: { setUserParameterNewProfilePicture: any, userParameterNewProfilePicture: any }) {
	const [message, setMessage] = useState('Drop some files here, or click to select files')

	const onDrop = useCallback((acceptedFiles: any[]) => {
		acceptedFiles.forEach((file) => {
			if (file.type.split('/')[0] != 'image') {
				setMessage('File must be an image...')
				return
			}


			const objectUrl = URL.createObjectURL(file)
			preview = objectUrl

			const reader = new FileReader()

			reader.onload = function(event) {
				// The file's text will be printed here
				console.log('reader :', event.target?.result)
			  };

			  reader.readAsDataURL(file)

			console.log('file :', file)

			props.setUserParameterNewProfilePicture(file)
		})

	}, [])


	if (props.userParameterNewProfilePicture == null)
		return (
			<input className="dropzone" type="file" accept=".jpeg,.jpg,.png" onChange={e => {console.log('input file :', e.target.files); props.setUserParameterNewProfilePicture(e.target.files?.item(0)); const objectUrl = URL.createObjectURL(e.target.files?.item(0) as File); preview = objectUrl}}/>
		)
	else
		return (
			<>
				<div className="user-parameter-content-text">Choose this pic ?</div>
				<div className="user-parameter-preview-new-profile-pic">
					<img src={preview} />
				</div>
				<div className="save-parameter low" onClick={e => { props.setUserParameterNewProfilePicture(null) }}>Change picture</div>
			</>
		)

}