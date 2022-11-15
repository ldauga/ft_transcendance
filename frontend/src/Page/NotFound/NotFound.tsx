import Background from '../../Module/Background/Background';
import NavBar from '../../Module/Navbar/Navbar';
import './NotFound.scss';

const NotFound = () => {

    return (
        <div className='not-found'>
            <NavBar openFriendConversFromProfile={false} dataFriendConversFromProfile={{ id: 0, login: "", nickname: "", profile_pic: "" }} setOpenFriendConversFromProfile={() => { }} />
            <Background />
            <div className='content'>
                <div title='404' className="text">
                    404
                </div>
            </div>
        </div>
    );
};

export default NotFound;
