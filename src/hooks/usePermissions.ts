import {useState, useEffect, useCallback} from 'react';
import {PermissionsAndroid} from 'react-native';
import {AppPermission, PermissionMap} from '$src/types/permissions';
import {logger} from '$src/utils/logger';

interface PermissionState {
  granted: boolean;
  loading: boolean;
  error: string | null;
  blocked: boolean;
  shouldShowRequest: boolean;
}

const initialState: PermissionState = {
  granted: false,
  loading: true,
  error: null,
  blocked: false,
  shouldShowRequest: false,
};

const usePermissions = (
  permission: AppPermission,
  onBlocked?: () => void,
) => {
  const [state, setState] = useState<PermissionState>(initialState);

  const getPermissionType = useCallback(() => {
    const permissionConfig = PermissionMap[permission];
    return permissionConfig.android;
  }, [permission]);

  const checkPermission = useCallback(async () => {
    setState(prev => ({...prev, loading: true, error: null}));
    try {
      const permissionType = getPermissionType();
      logger.info('Checking permission:', {permissionType});
      const isGranted = await PermissionsAndroid.check(permissionType);
      logger.info('Permission status:', permissionType + isGranted);

      if (isGranted) {
        setState({
          granted: true,
          loading: false,
          error: null,
          blocked: false,
          shouldShowRequest: false,
        });
        return true;
      }

      setState({
        granted: false,
        loading: false,
        error: null,
        blocked: false,
        shouldShowRequest: true,
      });

      return false;
    } catch (error) {
      logger.error('Permission check error:', error);
      setState({
        granted: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Permission check failed',
        blocked: false,
        shouldShowRequest: false,
      });
      return false;
    }
  }, [getPermissionType]);

  const requestPermission = async () => {
    setState(prev => ({...prev, loading: true, error: null}));
    try {
      const permissionType = getPermissionType();
      logger.info('Requesting permission:', permissionType);
      const result = await PermissionsAndroid.request(permissionType, {
        title: `${permission} Permission`,
        message: `App needs ${permission} permission to work properly`,
        buttonPositive: 'OK',
      });
      logger.info('Permission request result:', result);

      const isGranted = result === PermissionsAndroid.RESULTS.GRANTED;
      const isBlocked = result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

      if (isBlocked && onBlocked) {
        onBlocked();
      }

      setState({
        granted: isGranted,
        loading: false,
        error: null,
        blocked: isBlocked,
        shouldShowRequest: !isGranted && !isBlocked,
      });

      return isGranted;
    } catch (error) {
      logger.error('Permission request error:', error);
      setState({
        granted: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Permission request failed',
        blocked: false,
        shouldShowRequest: false,
      });
      return false;
    }
  };

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    ...state,
    requestPermission,
    checkPermission,
  };
};

export default usePermissions;
