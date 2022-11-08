import NavBar from '../../Module/Navbar/Navbar';
import './NotFound.scss';

const NotFound = () => {

    return (
        <div className='Font'>
            <NavBar openFriendConversFromProfile={false} dataFriendConversFromProfile={{ id: 0, login: "", nickname: "", profile_pic: "" }} setOpenFriendConversFromProfile={() => { }} />
            <h1>Error 404</h1>
            <h2>Page Not Found</h2>
        </div>
    );
};

export default NotFound;
