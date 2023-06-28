import React, {useEffect, useState} from 'react';
import {listChartByPageUsingPOST, listMyChartByPageUsingPOST} from "@/services/QI-BI/chartController";
import {message} from "antd/lib";
import {LikeOutlined, MessageOutlined, StarOutlined} from '@ant-design/icons';
import {Avatar, List, Input, Pagination, Space, Result, Button, ConfigProvider, Alert} from 'antd';
import ReactECharts from "echarts-for-react";
import Card from "antd/es/card/Card";
import {useModel} from '@umijs/max';
import Search from "antd/es/input/Search";


const MyChart: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 12,
    sortField: "createTime",
    sortOrder: "desc"
  }
  // ...解决对象污染
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({...initSearchParams});
  const [charList, setCharList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<Number>();
  const {initialState, setInitialState} = useModel('@@initialState');
  const {currentUser} = initialState ?? {};
  /**
   * 获取图表列表
   * async 将异步改为同步，只有获取到数据才会执行后面的代码
   */
  const loadData = async () => {
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);
      console.log("res.data:" + res.data.records);
      if (res.data) {
        setCharList(res.data.records ?? []);
        setTotal(res.data.total ?? 0)
        if (res.data.records) {
          res.data.records.forEach(data => {
            const chartOption = JSON.parse(data.genChart ?? "{}");
            chartOption.title = undefined;
            data.genChart = JSON.stringify(chartOption)
          })
        }
      } else {
        // message.error("获取图标列表失败!");
        return <div>图表数据格式错误，请联系管理员</div>;
      }
    } catch (e: any) {
      return <div>图表数据格式错误，请联系管理员</div>;
      // message.error("获取图标列表失败!" + e.message);
    }
  }



  const handleSearch = searchText => {
    setSearchParams({
      ...initSearchParams,
      name: searchText,
    })
  };

  function renderCharts() {
    return charList.map((chartData, index) => {
      try {
        const chartOption = JSON.parse(chartData.genChart ?? '{}');
        return <ReactECharts key={index} option={chartOption} />;
      } catch (error) {
        console.error('解析图表数据时出错:', error);
        return (
          <Alert
            key={index}
            message="图表数据格式错误"
            description="请联系管理员"
            type="error"
            showIcon
          />
        );
      }
    });
  }

  useEffect(() => {
    loadData();
  }, [searchParams])

  return (
    <div className="my-chart">
      <Search
        placeholder="请输入搜索内容"
        allowClear
        enterButton="Search"
        size="large"
        onSearch={handleSearch}
      />

      <List
        itemLayout="vertical"
        size="large"
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...initSearchParams,
              current: page,
              pageSize,
            })
            console.log(page);
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
        dataSource={charList}
        renderItem={(chart) => (
          <Card size={"small"} style={{marginTop: 16, marginLeft: 16}}>
            <List.Item
              key={chart.name}
            >
              <List.Item.Meta
                avatar={<Avatar src={currentUser.userAvatar}/>}
                title={chart.name}
                description={'图表类型:' + chart.chartType}
              />
              <>
                {
                  chart.status === "succeed" &&
                  <>
                      {'分析目标:' + chart.goal}
                      <div style={{marginBottom: 16}}></div>
                      <ReactECharts option={JSON.parse(chart.genChart ?? '{}')}/>
                      {'分析结论:' + chart.genResult}
                  </>
                }
                {
                  chart.status === "failed" &&
                  <>
                    <Result
                      status="error"
                      title="图表生成错误"
                      subTitle={chart.execMessage}
                    />
                  </>
                }
                {
                  chart.status === "running" &&
                  <>
                    <Result
                      status="info"
                      title="图表生成中"
                      subTitle={chart.execMessage}
                    />
                  </>
                }
                {
                  chart.status === "wait" &&
                  <>
                    <Result
                      status="warning"
                      title="图表待生成"
                      subTitle={chart.execMessage ?? "当前生成图表队列繁忙"}
                    />
                  </>
                }
              </>
            </List.Item>
          </Card>
        )}
      />
    </div>
  );
};

export default MyChart;
