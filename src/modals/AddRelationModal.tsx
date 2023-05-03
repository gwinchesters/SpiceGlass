import { RelationshipUpdate_Operation } from '@authzed/authzed-node/dist/src/v1'
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
  Switch,
  Typography,
} from 'antd'
import { startCase } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Schema } from '@/schema'
import { throwError } from '@/utils/error'
import { useModalStateStore, useZedStore } from '@/zustand'
import { AddRelationModalStateConfig, ModalState } from '@/zustand/modal'

const { Text } = Typography

type AddRelationForm = {
  subjectType: string
  subjectId: string
  relation: string
  resourceType: string
  resourceId: string
}

const useFormHandling = (
  form: FormInstance<AddRelationForm>,
  schema: Schema,
  modalState: ModalState<AddRelationModalStateConfig>,
) => {
  const { config = {} } = modalState
  const [resourceType, relation] = [
    Form.useWatch('resourceType', form),
    Form.useWatch('relation', form),
  ]
  const resourceTypes = useMemo(() => {
    return schema.definitions.map(({ name }) => ({
      value: name,
      label: startCase(name),
    }))
  }, [form, schema])
  const relationships = useMemo(() => {
    if (form && resourceType) {
      const currentValue = form.getFieldValue('relation')
      const newRelations =
        schema.getDefinitionByName(resourceType)?.relations.map(({ name }) => ({
          value: name,
          label: startCase(name),
        })) ?? []

      if (newRelations.find((r) => r.value === currentValue) === undefined) {
        form.resetFields(['relation'])
      }

      return newRelations
    }

    return []
  }, [form, resourceType])
  const subjectTypes = useMemo(() => {
    if (form && resourceType && relation) {
      const currentValue = form.getFieldValue('subjectType')
      const newSubjectTypes =
        schema
          .getDefinitionByName(resourceType)
          ?.relations.filter((r) => r.name === relation)
          .flatMap(({ resources }) => resources)
          .map(({ name }) => ({ value: name, label: startCase(name) })) ?? []

      if (newSubjectTypes.find((s) => s.value === currentValue) === undefined) {
        form.resetFields(['subjectType'])
      }

      return newSubjectTypes
    }
    return []
  }, [form, resourceType, relation])

  useEffect(() => {
    if (modalState.open) {
      form.setFieldsValue({
        relation: config.relation,
        resourceType: config.resource?.name,
        subjectType: config.subjectType?.name,
        subjectId: config.subjectId,
        resourceId: config.resourceId,
      })
    }
  }, [form, modalState])

  return {
    resourceTypes,
    relationships,
    subjectTypes,
  }
}

const AddRelationModal = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<AddRelationForm>()
  const [schema, spiceClient, triggerRefresh] = useZedStore((store) => [
    store.schema ?? throwError('Invalid schema.'),
    store.spiceClient ?? throwError('Invalid client.'),
    store.triggerRefresh,
  ])
  const [submitError, setSubmitError] = useState<string>()
  const [modalState, triggerComplete] = useModalStateStore((store) => [
    store.addRelation,
    store.triggerAddRelationComplete,
  ])
  const [touchOperation, setTouchOperation] = useState<boolean>(true)
  const { resourceTypes, relationships, subjectTypes } = useFormHandling(
    form,
    schema,
    modalState,
  )

  const onSubmit = useCallback(
    async (cancelled = false) => {
      if (!cancelled) {
        let values: AddRelationForm | undefined
        void messageApi.open({
          type: 'loading',
          content: `Creating...`,
          duration: 0,
        })
        try {
          values = await form.validateFields()
        } catch (e) {
          return
        }

        try {
          await spiceClient.runner.writeRelationships({
            updates: [
              {
                operation: touchOperation
                  ? RelationshipUpdate_Operation.TOUCH
                  : RelationshipUpdate_Operation.CREATE,
                relationship: {
                  resource: {
                    objectType: values.resourceType,
                    objectId: values.resourceId,
                  },
                  relation: values.relation,
                  subject: {
                    object: {
                      objectType: values.subjectType,
                      objectId: values.subjectId,
                    },
                    optionalRelation: '',
                  },
                },
              },
            ],
            optionalPreconditions: [],
          })

          messageApi.destroy()
          void messageApi.open({
            type: 'success',
            content: `Relation created.`,
            duration: 3,
          })
          triggerRefresh()
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
      }

      form.resetFields()
      setSubmitError(undefined)
      triggerComplete(cancelled)
    },
    [
      form,
      triggerComplete,
      spiceClient,
      setSubmitError,
      triggerRefresh,
      touchOperation,
    ],
  )

  return (
    <Modal
      title="Add Relationship"
      width="70vw"
      open={modalState.open}
      onOk={() => onSubmit()}
      onCancel={() => onSubmit(true)}
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
              label="Relation"
              name="relation"
              dependencies={['resourceType']}
              rules={[{ required: true, message: 'Please select a relation' }]}
            >
              <Select
                showSearch
                placeholder="Select a subject type"
                options={relationships}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="space-between">
          <Col span={11}>
            <Form.Item
              label="Subject Type"
              name="subjectType"
              dependencies={['resourceType', 'relation']}
              rules={[
                { required: true, message: 'Please select a subject type' },
              ]}
            >
              <Select
                showSearch
                placeholder="Select a subject type"
                options={subjectTypes}
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
        <Row justify="end">
          <Col>
            <Space>
              <Text>Operation Mode:</Text>
              <Switch
                checkedChildren="Touch"
                unCheckedChildren="Create"
                checked={touchOperation}
                onChange={(checked) => setTouchOperation(checked)}
              />
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default AddRelationModal
