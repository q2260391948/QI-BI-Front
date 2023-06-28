import {InboxOutlined, UploadOutlined} from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Form,
  Row,
  Select,
  Space,
  Spin,
  Upload,
} from 'antd';
import {FormattedMessage, history, useIntl, useModel, Helmet} from '@umijs/max';
import React, {useState} from 'react';
import TextArea from "antd/es/input/TextArea";
import Input from "antd/es/input/Input";
import {uploadFileUsingPOST} from "@/services/QI-BI/chartController";
import {message} from "antd/lib";
import Card from "antd/es/card/Card";
import {useForm} from 'antd/lib/form/Form';

const AddChartAsync: React.FC = () => {
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };

    const [chart, setChart] = useState<API.BiResponse>();
    const [option, setoption] = useState<any>();
    const [submitting, setSubmitting] = useState<Boolean>(false);
    const [form] = useForm();


    const onFinish = async (values: any) => {
        setSubmitting(true);
        const params = {
          ...values,
          file: undefined
        };
        const res = await uploadFileUsingPOST(params, {}, values.file.file.originFileObj);
        console.log(res?.code)
        setSubmitting(false);
        setoption(null)
        form.resetFields();
        message.success("分析提交成功，图表结果请在我的图标页查看！")
      }
    ;
    return (
      <div className="add-chart_async">
        <Row gutter={24}>
          <Col span={10}>
            <Card title={"智能分析"}>
              <Form form={form}
                    name="addChart"
                    {...formItemLayout}
                    onFinish={onFinish}
                    initialValues={{}}
              >
                <Form.Item name="goal" label="分析目标" rules={[{required: true, message: '请输入您的分析目标!'}]}>
                  <TextArea placeholder="请输入您的分析需求:"/>
                </Form.Item>

                <Form.Item name="name" label="图标名称" rules={[{required: true, message: '请输入您的图表名称!'}]}>
                  <Input placeholder="请输入您的图表类型:"/>
                </Form.Item>

                <Form.Item
                  name="chartType"
                  label="图表类型"
                  hasFeedback
                  rules={[{required: true, message: '请选择您的图表类型'}]}
                >
                  <Select options={[
                    {value: '折线图', label: '折线图'},
                    {value: '柱状图', label: '柱状图'},
                    {value: '堆叠图', label: '堆叠图'},
                    {value: '饼图', label: '饼图'},
                    {value: '雷达图', label: '雷达图'},
                  ]}>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="file"
                  label="原始数据"
                >
                  <Upload name="file" maxCount={1}>
                    <Button icon={<UploadOutlined/>}>上传excel文件</Button>
                  </Upload>
                </Form.Item>
                <Form.Item wrapperCol={{span: 12, offset: 6}}>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                      智能分析
                    </Button>
                    <Button htmlType="reset">重置</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
;

export default AddChartAsync;
