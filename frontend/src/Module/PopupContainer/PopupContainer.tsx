import './PopupContainer.scss';

export const PopupContainer = ({ open, setClose, children }: any) => {
	return (
		<div className={open ? 'open popupContainer' : 'close popupContainer'}>
			{/* <button onClick={() => setClose()} type='button' className="closeButton"></button> */}
			{/* on verra après pour le boutton */}
			<div id='contentPopUpContainer'>{children}</div>
		</div>
	)
}