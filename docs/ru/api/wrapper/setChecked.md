## setChecked(checked)

Устанавливает значение отмеченным элемент ввода типа чекбокса или радиокнопки и обновляет связанные данные с `v-model`.

- **Аргументы:**

  - `{Boolean} checked (по умолчанию: true)`

- **Примеры:**

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

- **Примечание:**

Когда вы пытаетесь установить значение в состояние через `v-model` с помощью `radioInput.element.checked = true; radioInput.trigger('input')`, `v-model` не вызывается. `v-model` генерируется событием `change`.

`checkboxInput.setChecked(checked)` — псевдоним для следующего кода.

```js
checkboxInput.element.checked = checked
checkboxInput.trigger('click')
checkboxInput.trigger('change')
```
