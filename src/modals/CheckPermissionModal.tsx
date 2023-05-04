import { CheckCircleOutlined } from '@ant-design/icons'
import { CheckPermissionResponse_Permissionship } from '@authzed/authzed-node/dist/src/v1'
import {
  Col,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from 'antd'
import { startCase } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Schema } from '@/schema'
import { throwError } from '@/utils/error'
import { useModalStateStore, useZedStore } from '@/zustand'
import { CheckPermissionModalStateConfig, ModalState } from '@/zustand/modal'

const { Text } = Typography

type CheckPermissionForm = {
  subjectType: string
  subjectId: string
  permission: string
  resourceType: string
  resourceId: string
}

const useFormHandling = (
  form: FormInstance<CheckPermissionForm>,
  schema: Schema,
  modalState: ModalState<CheckPermissionModalStateConfig>,
) => {
  const { config = {} } = modalState
  const [resourceType] = [Form.useWatch('resourceType', form)]
  const resourceTypes = useMemo(() => {
    return schema.definitions.map(({ name }) => ({
      value: name,
      label: startCase(name),
    }))
  }, [form, schema])
  const permissions = useMemo(() => {
    if (form && resourceType) {
      const currentValue = form.getFieldValue('permission')
      const newPermissions =
        schema
          .getDefinitionByName(resourceType)
          ?.permissions.map(({ name }) => ({
            value: name,
            label: startCase(name),
          })) ?? []

      if (newPermissions.find((r) => r.value === currentValue) === undefined) {
        form.resetFields(['permission'])
      }

      return newPermissions
    }

    return []
  }, [form, resourceType])

  useEffect(() => {
    if (modalState.open) {
      form.setFieldsValue({
        permission: config.permission,
        resourceType: config.resource?.name,
        subjectType: config.subjectType?.name,
        subjectId: config.subjectId,
        resourceId: config.resourceId,
      })
    }
  }, [form, modalState])

  return {
    resourceTypes,
    permissions,
  }
}

const CheckPermissionModal = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<CheckPermissionForm>()
  const [schema, spiceClient, triggerRefresh] = useZedStore((store) => [
    store.schema ?? throwError('Invalid schema.'),
    store.spiceClient ?? throwError('Invalid client.'),
    store.triggerRefresh,
  ])
  const [submitError, setSubmitError] = useState<string>()
  const [permissionResult, setPermissionResult] =
    useState<CheckPermissionResponse_Permissionship>()
  const [modalState, triggerComplete] = useModalStateStore((store) => [
    store.checkPermission,
    store.triggerCheckPermissionComplete,
  ])
  const { resourceTypes, permissions } = useFormHandling(
    form,
    schema,
    modalState,
  )

  const onSubmit = useCallback(async () => {
    let values: CheckPermissionForm | undefined
    setPermissionResult(undefined)
    void messageApi.open({
      type: 'loading',
      content: `Checking...`,
      duration: 0,
    })
    try {
      values = await form.validateFields()
    } catch (e) {
      messageApi.destroy()
      return
    }

    try {
      const result = await spiceClient.runner.checkPermission({
        resource: {
          objectType: values.resourceType,
          objectId: values.resourceId,
        },
        permission: values.permission,
        subject: {
          object: {
            objectType: values.subjectType,
            objectId: values.subjectId,
          },
          optionalRelation: '',
        },
      })
      setPermissionResult(result.permissionship)

      messageApi.destroy()
    } catch (e) {
      messageApi.destroy()
      void messageApi.open({
        type: 'error',
        content: `Error submitting.`,
        duration: 2,
      })
      setSubmitError((e as { details: string }).details)
      return
    }
  }, [
    form,
    triggerComplete,
    spiceClient,
    setSubmitError,
    triggerRefresh,
    setPermissionResult,
  ])

  const onClose = () => {
    form.resetFields()
    setPermissionResult(undefined)
    setSubmitError(undefined)
    triggerComplete(true)
  }

  return (
    <Modal
      title="Check Permission"
      width="70vw"
      open={modalState.open}
      onOk={() => onSubmit()}
      onCancel={() => onClose()}
      cancelText="Close"
    >
      {contextHolder}
      {submitError && (
        <div
          style={{
            padding: '1em',
            backgroundColor: '#ececec',
            borderRadius: '5px',
          }}
        >
          <Text type="danger">
            <b>Error:</b> {submitError}
          </Text>
        </div>
      )}
      <Form
        onKeyUp={({ key }) => key === 'Enter' && onSubmit()}
        style={{ padding: '1em' }}
        name="add"
        form={form}
        requiredMark={false}
      >
        <Row justify="space-between">
          <Col span={11}>
            <Form.Item
              label="Resource Type"
              name="resourceType"
              rules={[
                { required: true, message: 'Please select a resource type' },
              ]}
            >
              <Select
                showSearch
                placeholder="Select a resource type"
                options={resourceTypes}
              />
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              label="Resource ID"
              name="resourceId"
              rules={[
                { required: true, message: 'Please enter a resource ID' },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="space-around">
          <Col span={11}>
            <Form.Item
              label="Permission"
              name="permission"
              dependencies={['resourceType']}
              rules={[
                { required: true, message: 'Please select a permission' },
              ]}
            >
              <Select
                showSearch
                placeholder="Select a permission"
                options={permissions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="space-between">
          <Col span={11}>
            <Form.Item
              label="Subject Type"
              name="subjectType"
              rules={[
                { required: true, message: 'Please select a subject type' },
              ]}
            >
              <Select
                showSearch
                placeholder="Select a subject type"
                options={resourceTypes}
              />
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              label="Subject ID"
              name="subjectId"
              rules={[{ required: true, message: 'Please enter a subject ID' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {permissionResult && (
        <div
          style={{
            padding: '1em',
            backgroundColor: '#ececec',
            borderRadius: '5px',
          }}
        >
          {permissionResult ===
          CheckPermissionResponse_Permissionship.HAS_PERMISSION ? (
            <Text type="success">
              <Space>
                <CheckCircleOutlined />
                {`${startCase(
                  form.getFieldValue('subjectType'),
                )} ${form.getFieldValue('subjectId')} can ${form.getFieldValue(
                  'permission',
                )} ${startCase(
                  form.getFieldValue('resourceType'),
                )} ${form.getFieldValue('resourceId')}`}
              </Space>
            </Text>
          ) : (
            <Text type="danger">
              <Space>
                <CheckCircleOutlined />
                {`${startCase(
                  form.getFieldValue('subjectType'),
                )} ${form.getFieldValue(
                  'subjectId',
                )} cannot ${form.getFieldValue('permission')} ${startCase(
                  form.getFieldValue('resourceType'),
                )} ${form.getFieldValue('resourceId')}`}
              </Space>
            </Text>
          )}
        </div>
      )}
    </Modal>
  )
}

export default CheckPermissionModal
