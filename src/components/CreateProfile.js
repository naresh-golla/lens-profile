import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from "../allContextProvider"
import { Image } from 'antd';
import { Spin } from 'antd';
import { LoadingOutlined ,UploadOutlined} from '@ant-design/icons';
import { Form, Input, InputNumber, Button,Upload } from 'antd';

const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 8,
    },
  };
  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };
const CreateProfile = () => {

    const onFinish = (values) => {
        console.log(values);
    };

    const normFile = (e) => {
        console.log('Upload event:', e);      
        if (Array.isArray(e)) {
          return e[0] && e[0].fileList;
        }
        return e && e.fileList;
    };

    return (
        <div className="nft-wrapper">
    <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages}>
      <Form.Item
        name={['user', 'name']}
        label="handle"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="upload"
        label="Upload"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload name="logo" action="/upload.do" listType="picture" maxCount={1}>
          <Button icon={<UploadOutlined />}>Click to upload Profile Pic</Button>
        </Upload>
      </Form.Item>
     
      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>

    </Form>
        </div>
    )
}

export default CreateProfile