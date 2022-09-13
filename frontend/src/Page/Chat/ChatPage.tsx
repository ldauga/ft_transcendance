import './ChatPage.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../State/Reducers';
import { validateInput } from '../../Utils/logUtils';
import LoginPage from '../../Components/Chat/LoginPage';
import Chat from '../../Components/Chat/Chat';

function ChatPage() {

  const logData = useSelector((state: RootState) => state.log)
  const utilsData = useSelector((state: RootState) => state.utils)

  utilsData.socket.on('disconnect', function () {
    console.log('Disconnected');
  });

  function MainAff() {
    if (validateInput(logData.username))
      return (
        <>
          <Chat />
        </>
      )
    else
      return (
        <LoginPage />
      )
  }

  return (
    <div className="ChatPage">
      <MainAff />
    </div>
  );
}

export default ChatPage;