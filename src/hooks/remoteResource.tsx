import { useState, useEffect } from 'react';
import odooApi from '../api/odoo';


const useRemoteResource = (id: number, type: 'task' | 'project') => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResourceValid, setIsResourceValid] = useState(false);
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchResourceInfo = async () => {
      if (id === 0) {
        setIsResourceValid(false);
        setName('');
        setErrorMsg('');
        return;
      }

      setIsLoading(true);
      const resourceInfo = await odooApi.getResourceInfo(id, type);
      
      if (!resourceInfo) {
        setIsResourceValid(false);
        setName('');
        setErrorMsg(`There is no ${type} with ID ${id}.`);
      } else {
        setName(resourceInfo.displayName);
        if (!resourceInfo.canTimesheet) {
          setIsResourceValid(false);
          setErrorMsg(`This ${type} cannot be used for timesheets.`);
        } else {
          setIsResourceValid(true);
          setErrorMsg('');
        }
      }
      
      setIsLoading(false);
    };

    fetchResourceInfo();
  }, [id, type]);

  return { isLoading, isResourceValid, name, errorMsg, setName };
};

export default useRemoteResource;