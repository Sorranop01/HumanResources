import { SettingOutlined } from '@ant-design/icons';
import { Card, Descriptions } from 'antd';
import type { FC } from 'react';

export const SystemConfigPage: FC = () => {
  return (
    <div>
      <Card
        title={
          <span>
            <SettingOutlined /> ตั้งค่าระบบ
          </span>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ภาษาเริ่มต้น">ไทย</Descriptions.Item>
          <Descriptions.Item label="Default Language">Thai (th)</Descriptions.Item>
          <Descriptions.Item label="เขตเวลา">Asia/Bangkok (GMT+7)</Descriptions.Item>
          <Descriptions.Item label="รูปแบบวันที่">DD/MM/YYYY</Descriptions.Item>
          <Descriptions.Item label="รูปแบบเวลา">24 ชั่วโมง</Descriptions.Item>
          <Descriptions.Item label="สกุลเงินหลัก">THB (บาท)</Descriptions.Item>
          <Descriptions.Item label="Session Timeout" span={2}>
            30 นาที
          </Descriptions.Item>
          <Descriptions.Item label="การแจ้งเตือนอีเมล">เปิดใช้งาน</Descriptions.Item>
          <Descriptions.Item label="การแจ้งเตือน SMS">ปิดใช้งาน</Descriptions.Item>
          <Descriptions.Item label="Push Notification">เปิดใช้งาน</Descriptions.Item>
          <Descriptions.Item label="MFA">ปิดใช้งาน</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};
