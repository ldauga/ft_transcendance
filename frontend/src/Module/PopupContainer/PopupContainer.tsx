import './PopupContainer.scss';

export const PopupContainer = ({open, setClose, children}: any) => {
	return (
		<div className={open ? 'open popupContainer' : 'close popupContainer'}>
			<button onClick={() => setClose()} type='button' className="closeButton"></button>
			<div className='content'>{children}</div>
		</div>
	)
}