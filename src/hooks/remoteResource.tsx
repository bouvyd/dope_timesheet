import { useState, useEffect } from 'react';
import odooApi from '../api/odoo';


const useRemoteResource = (id: number, type: 'task' | 'project') => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavoriteValid, setIsFavoriteValid] = useState(false);
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchFavoriteInfo = async () => {
      if (id === 0) {
        setIsFavoriteValid(false);
        setName('');
        setErrorMsg('');
        return;
      }

      setIsLoading(true);
      const favoriteInfo = await odooApi.getFavoriteInfo(id, type);
      
      if (!favoriteInfo) {
        setIsFavoriteValid(false);
        setName('');
        setErrorMsg(`There is no ${type} with ID ${id}.`);
      } else {
        setName(favoriteInfo.displayName);
        if (!favoriteInfo.canTimesheet) {
          setIsFavoriteValid(false);
          setErrorMsg(`This ${type} cannot be used for timesheets.`);
        } else {
          setIsFavoriteValid(true);
          setErrorMsg('');
        }
      }
      
      setIsLoading(false);
    };

    fetchFavoriteInfo();
  }, [id, type]);

  return { isLoading, isFavoriteValid, name, errorMsg, setName };
};

export default useRemoteResource;