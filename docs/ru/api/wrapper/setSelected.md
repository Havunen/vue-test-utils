## setSelected()

Выбирает элемент пункта списка и обновляет связанные данные `v-model`.

- **Пример:**

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

- **Примечание:**

Когда вы пытаетесь установить значение в состояние через `v-model` с помощью `option.element.selected = true; parentSelect.trigger('input')`, `v-model` не вызывается. `v-model` генерируется событием `change`.

`option.setSelected()` — псевдоним для следующего кода.

```js
option.element.selected = true
parentSelect.trigger('change')
```
