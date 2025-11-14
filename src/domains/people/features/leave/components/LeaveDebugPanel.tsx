/**
 * Debug Panel for Leave Data
 * Temporary component to help debug leave data issues
 */

import { Alert, Button, Card, Descriptions, Space, Spin } from 'antd';
import { collection, type DocumentData, getDocs, query, where } from 'firebase/firestore';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { db } from '@/shared/lib/firebase';

type DocumentWithId = DocumentData & { id: string };

type LeaveBalanceSample = {
  id: string;
  employeeId?: string;
  employeeName?: string;
  leaveTypeName?: string;
  totalDays?: number;
  remainingDays?: number;
};

type EmployeeSample = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userId?: string;
};

type DebugCollections = {
  leaveBalances?: {
    total: number;
    sample: LeaveBalanceSample[];
  };
  userLeaveBalances?: {
    total?: number;
    data?: DocumentWithId[];
    error?: string;
  };
  employees?: {
    total: number;
    sample: EmployeeSample[];
  };
  users?: {
    total: number;
    currentUser: DocumentData | null;
  };
};

type DebugInfo = {
  auth: {
    user: string;
    userId: string;
    employeeId: string;
  };
  collections: DebugCollections;
  userEmployeeRecord?: {
    found: boolean;
    data?: DocumentWithId;
  };
  error?: string;
};

export const LeaveDebugPanel: FC = () => {
  const { user, employeeId, loading: authLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebug = useCallback(async () => {
    setIsLoading(true);
    const info: DebugInfo = {
      auth: {
        user: user?.email || 'Not logged in',
        userId: user?.id || 'N/A',
        employeeId: employeeId || 'N/A (THIS IS THE PROBLEM!)',
      },
      collections: {},
    };

    try {
      // Check leaveBalances collection
      console.log('🔍 Checking leaveBalances collection...');
      const leaveBalancesRef = collection(db, 'leaveBalances');
      const leaveBalancesSnapshot = await getDocs(leaveBalancesRef);

      info.collections.leaveBalances = {
        total: leaveBalancesSnapshot.size,
        sample: leaveBalancesSnapshot.docs.slice(0, 3).map(
          (doc): LeaveBalanceSample => ({
            id: doc.id,
            employeeId: doc.data().employeeId,
            employeeName: doc.data().employeeName,
            leaveTypeName: doc.data().leaveTypeName,
            totalDays: doc.data().totalDays,
            remainingDays: doc.data().remainingDays,
          })
        ),
      };

      console.log('📊 Total leave balances:', leaveBalancesSnapshot.size);

      // Check if any match current employeeId
      if (employeeId) {
        console.log('🔍 Querying for employeeId:', employeeId);
        const q = query(leaveBalancesRef, where('employeeId', '==', employeeId));
        const userBalancesSnapshot = await getDocs(q);

        info.collections.userLeaveBalances = {
          total: userBalancesSnapshot.size,
          data: userBalancesSnapshot.docs.map(
            (doc): DocumentWithId => ({
              id: doc.id,
              ...doc.data(),
            })
          ),
        };

        console.log('✅ Found leave balances for user:', userBalancesSnapshot.size);
      } else {
        console.warn('⚠️ No employeeId available - cannot query user balances');
        info.collections.userLeaveBalances = {
          error: 'No employeeId available',
        };
      }

      // Check employees collection
      console.log('🔍 Checking employees collection...');
      const employeesRef = collection(db, 'employees');
      const employeesSnapshot = await getDocs(employeesRef);

      info.collections.employees = {
        total: employeesSnapshot.size,
        sample: employeesSnapshot.docs.slice(0, 3).map(
          (doc): EmployeeSample => ({
            id: doc.id,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            email: doc.data().email,
            userId: doc.data().userId,
          })
        ),
      };

      // Check if current user has employee record
      if (user?.id) {
        const userEmployeeQuery = query(employeesRef, where('userId', '==', user.id));
        const userEmployeeSnapshot = await getDocs(userEmployeeQuery);

        info.userEmployeeRecord = {
          found: userEmployeeSnapshot.size > 0,
          data: userEmployeeSnapshot.docs.map(
            (doc): DocumentWithId => ({
              id: doc.id,
              ...doc.data(),
            })
          )[0],
        };

        console.log('👤 User employee record:', info.userEmployeeRecord);
      }

      // Check users collection
      console.log('🔍 Checking users collection...');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      const currentUserData = user?.id
        ? (usersSnapshot.docs.find((doc) => doc.id === user.id)?.data() ?? null)
        : null;

      info.collections.users = {
        total: usersSnapshot.size,
        currentUser: currentUserData,
      };
    } catch (error: unknown) {
      console.error('❌ Debug error:', error);
      info.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setDebugInfo(info);
    setIsLoading(false);
    console.log('🐛 Debug Info:', info);
  }, [employeeId, user]);

  useEffect(() => {
    if (!authLoading && user) {
      runDebug();
    }
  }, [authLoading, user, runDebug]);

  if (authLoading) {
    return (
      <Card title="🐛 Leave Debug Panel">
        <Spin />
      </Card>
    );
  }

  return (
    <Card
      title="🐛 Leave Debug Panel"
      extra={
        <Button type="primary" onClick={runDebug} loading={isLoading}>
          Refresh Debug Info
        </Button>
      }
    >
      {!debugInfo ? (
        <Spin />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {debugInfo.error && (
            <Alert type="error" message="Debug Error" description={debugInfo.error} />
          )}

          <Descriptions title="Authentication" bordered column={1}>
            <Descriptions.Item label="User">{debugInfo.auth.user}</Descriptions.Item>
            <Descriptions.Item label="User ID">{debugInfo.auth.userId}</Descriptions.Item>
            <Descriptions.Item label="Employee ID">
              <strong style={{ color: employeeId ? 'green' : 'red' }}>
                {debugInfo.auth.employeeId}
              </strong>
            </Descriptions.Item>
          </Descriptions>

          <Descriptions title="Collections" bordered column={1}>
            <Descriptions.Item label="Leave Balances">
              {debugInfo.collections.leaveBalances?.total || 0} documents
            </Descriptions.Item>
            <Descriptions.Item label="User Leave Balances">
              {debugInfo.collections.userLeaveBalances?.total || 0} documents
              {debugInfo.collections.userLeaveBalances?.error && (
                <Alert
                  type="error"
                  message={debugInfo.collections.userLeaveBalances.error}
                  style={{ marginTop: 8 }}
                />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Employees">
              {debugInfo.collections.employees?.total || 0} documents
            </Descriptions.Item>
            <Descriptions.Item label="Users">
              {debugInfo.collections.users?.total || 0} documents
            </Descriptions.Item>
          </Descriptions>

          {debugInfo.userEmployeeRecord && (
            <Alert
              type={debugInfo.userEmployeeRecord.found ? 'success' : 'error'}
              message={
                debugInfo.userEmployeeRecord.found
                  ? '✅ Employee record found for current user'
                  : '❌ No employee record found for current user'
              }
              description={
                debugInfo.userEmployeeRecord.found && (
                  <pre>{JSON.stringify(debugInfo.userEmployeeRecord.data, null, 2)}</pre>
                )
              }
            />
          )}

          <Alert
            type="info"
            message="Debug Data"
            description={
              <pre style={{ maxHeight: 400, overflow: 'auto' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            }
          />
        </Space>
      )}
    </Card>
  );
};
