## trigger

为 `WrapperArray` 的每个 `Wrapper` DOM 节点都触发一个[事件](../../guides/dom-events.md#触发事件)。

**注意：该包裹器必须包含一个 Vue 实例。**

- **参数：**

  - `{string} eventType` **必填**
  - `{Object} options` **可选**

- **示例：**

```js
import { mount } from 'vue2-test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

test('trigger demo', async () => {
  const clickHandler = sinon.stub()
  const wrapper = mount(Foo, {
    propsData: { clickHandler }
  })

  const divArray = wrapper.findAll('div')
  await divArray.trigger('click')
  expect(clickHandler.called).toBe(true)
})
```
