## setChecked

设置 checkbox 或 radio 类 `<input>` 元素的 checked 值并更新 `v-model` 绑定的数据。

- **参数：**

  - `{Boolean} checked (默认值：true)`

- **示例：**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

test('setChecked demo', async () => {
  const wrapper = mount(Foo)
  const radioInput = wrapper.find('input[type="radio"]')

  await radioInput.setChecked()

  expect(radioInput.element.checked).toBeTruthy()
})
```

- **注意：**

当你尝试通过 `radioInput.element.checked = true; radioInput.trigger('input')` 经由 `v-model` 向 state 设置值的时候，`v-model` 不会被触发。`v-model` 是被 `change` 事件触发的。

`checkboxInput.setChecked(checked)` 是接下来这段代码的别名。

```js
checkboxInput.element.checked = checked
checkboxInput.trigger('click')
checkboxInput.trigger('change')
```
