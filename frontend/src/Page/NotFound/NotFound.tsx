import Navbar from '../../Module/Navbar/Navbar';
import './../assets/Font.css';
import './NotFound.css';

const NotFound = () => {

    return (
        <div className='Font'>
            <Navbar/>
            <h1>Error 404</h1>
            <h2>Page Not Found</h2>
        </div>
    );
  };

  export default NotFound;
