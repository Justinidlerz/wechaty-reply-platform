import './index.scss';
import React, { Component } from 'react';
import { Table, Button, Modal, Form, Icon, Input, Radio, message } from 'antd';
import superagent from 'superagent';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class Body extends Component {
    constructor (props, state) {
        super(props, state);
        this.state = {
            editingContent: {},
            confirmLoading: false,
            visible: false,
            data: []
        };
        this.getData();
    }
    columns = [{
        title: '序号',
        dataIndex: 'data.index',
        width: '10%',
        render: (text, record, index) => (index + 1)
    }, {
        title: '类型',
        dataIndex: 'types',
        width: '15%',
        render: types => types === 1 ? '包含' : '全等'
    }, {
        title: '内容',
        width: '30%',
        dataIndex: 'content'
    }, {
        title: '回复内容',
        width: '30%',
        dataIndex: 'reply'
    }, {
        title: '控制',
        dataIndex: '_id',
        width: '15%',
        render: (id, data) => <span className="ctrl">
            <Button type="danger" onClick={this.handleDelete.bind(this, id)}>删除</Button>
            <Button type="primary" onClick={this.handleModalShow.bind(this, Object.assign({}, data))}>编辑</Button>
        </span>
    }];
    handleDelete (id) {
        superagent
            .del(`/api/autoReply/${id}`)
            .end((err, res) => {
                if (err) {
                    return message.error(err.message);
                }
                message.success('删除成功');
                this.getData();
            })
    }
    handleEdit () {
        if (this.state.editingContent._id) {
            superagent
                .patch(`/api/autoReply/${this.state.editingContent._id}`)
                .send(this.state.editingContent)
                .end((err, res) => {
                    if (err) {
                        return message.error(err.message);
                    }
                    this.setState({
                        visible: false
                    });
                    message.success('修改成功');
                    this.getData();
                });
        } else {
            if(!this.state.editingContent.types) {
                this.state.editingContent.types = 1;
            }
            superagent
                .post('/api/autoReply')
                .send(this.state.editingContent)
                .end((err, res) => {
                    if (err) {
                        return message.error(err.message);
                    }
                    this.setState({
                        visible: false
                    });
                    message.success('新增成功');
                    this.getData();
                })
        }
    }
    getData () {
        superagent
            .get('/api/autoReply')
            .end((err, res) => {
                if (err) {
                    return message.error(err.message);
                } 
                this.setState({
                    data: res.body.docs
                });
            })
    }
    handleModalCancel () {
        this.setState({ 
            visible: false
        });
    }
    handleModalShow (data) {
        this.setState({ 
            editingContent: data,
            visible: true 
        });
    }
    handleFormChange (type, e) {
        const data = {
            [type]: e.target.value
        };
        this.setState({
            editingContent: Object.assign(this.state.editingContent, data)
        });
    }
    render () {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                span: 24,
                offset: 0,
                },
                sm: {
                span: 14,
                offset: 6,
                },
            },
        };
        return <main>
            <header className="layout-header">
                <h1>微信自动回复内容管理平台<Button type="primary" onClick={this.handleModalShow.bind(this, {})}>新增</Button></h1>
            </header>
            <Table columns={this.columns} dataSource={this.state.data} pagination={false} />
            <Modal title="Title"
                visible={this.state.visible}
                onOk={this.handleEdit.bind(this)}
                confirmLoading={this.state.confirmLoading}
                onCancel={this.handleModalCancel.bind(this)} >
                <Form onSubmit={this.handleSubmit}>
                    <FormItem {...formItemLayout} label="类型">
                        <RadioGroup defaultValue={this.state.editingContent.types || 1} onChange={this.handleFormChange.bind(this, 'types')}>
                            <RadioButton value={1}>包含</RadioButton>
                            <RadioButton value={2}>全等</RadioButton>
                        </RadioGroup>
                    </FormItem>
                    <FormItem {...formItemLayout} label="内容">
                        <Input value={this.state.editingContent.content} placeholder="请输入监听内容" onChange={this.handleFormChange.bind(this, 'content')} />
                    </FormItem>
                    <FormItem {...formItemLayout} label="回复">
                        <Input value={this.state.editingContent.reply} placeholder="请输入回复内容" onChange={this.handleFormChange.bind(this, 'reply')} />
                    </FormItem>
                    {/*<FormItem {...tailFormItemLayout} label="">
                        <Button type="dashed" onClick={this.handleAddReplyItem.bind(this)} style={{ width: '60%' }}>
                            <Icon type="plus" /> 添加回复
                        </Button>
                    </FormItem>*/}
                </Form>
            </Modal>
        </main>
    }
}

export default Body;