import axios from "axios";
import { useEffect, useState } from "react";

export default function useFindUser() {
    const [user, setUser] = useState(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() =>{
        async function findUser() {
        await axios.get('localhost:5001/user/userExist')
        .then(res => {
            setUser(res.data);
            setLoading(false);
        }).catch(err => {
            setLoading(false);
        });
        }
        
        findUser();  
    }, []);
    
    return {
        user,
        setUser,
        isLoading
    }
}