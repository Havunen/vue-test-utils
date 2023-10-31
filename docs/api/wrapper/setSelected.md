## setSelected

Selects an option element and updates `v-model` bound data.

- **Example:**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

test('setSelected demo', async () => {
  const wrapper = mount(Foo)
  const options = wrapper.find('select').findAll('option')

  await options.at(1).setSelected()

  expect(wrapper.find('option:checked').element.value).toBe('bar')
})
```

- **Note:**

When you try to set the value to state via `v-model` by `option.element.selected = true; parentSelect.trigger('input')`, `v-model` is not triggered. `v-model` is triggered by `change` event.

`option.setSelected()` is an alias of the following code.

```js
option.element.selected = true
parentSelect.trigger('change')
```
