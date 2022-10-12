import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './MatchHistory.scss';

function MatchHistory() {

    const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
	
	axios.get('http://localhost:5001/matchesHistory/parsedMatchesHistory/' + persistantReducer.userReducer.user?.id).then(res => console.log(res.data))

	return (
		<></>
	)

}

export default MatchHistory;