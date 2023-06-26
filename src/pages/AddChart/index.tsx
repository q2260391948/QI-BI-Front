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
import ReactECharts from 'echarts-for-react';
import Card from "antd/es/card/Card";

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const {initialState, setInitialState} = useModel('@@initialState');

  const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
  };

  const [chart, setChart] = useState<API.BiResponse>();
  const [option, setoption] = useState<any>();
  const [submitting, setSubmitting] = useState<Boolean>(false);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    const params = {
      ...values,
      file: undefined
    };
    try {
      const res = await uploadFileUsingPOST(params, {}, values.file.file.originFileObj);
      console.log(res)
      if (res?.data) {
        setSubmitting(false);
        setoption(null)
        setChart(null);
        const chartOption = JSON.parse(res.data.genChart ?? '');
        if (!chartOption) {
          throw new Error("图表代码生成错误!")
        } else {
          setChart(res.data)
          setoption(JSON.parse(res.data?.genChart));
          console.log("option:" + option)
        }
        message.success("分析成功")
      } else {
        setSubmitting(false);
        message.error("分析失败");
      }
    } catch (e: any) {

    }
  };
  return (
    <div className="add-chart">
      <Row gutter={24}>
        <Col span={10}>
          <Card title={"智能分析"}>
            <Form
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
        <Col span={14}>
          <Card title={"可视化图表"}>
            <div>{
              (option && <ReactECharts option={option}/>) ?? <div>请先提交待分析的数据</div>
            }</div>
            <Spin spinning={submitting} />
          </Card>
          <Divider/>
          <Card title={"分析结论"}>
            <div>{chart?.genResult ?? <div>请先提交待分析的数据</div>}</div>
            <Spin spinning={submitting} />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default Login;
