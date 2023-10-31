## trigger(eventType [, options ])

`Wrapper` DOM ノードのイベントを発火します。

Trigger は `options` オブジェクト形式で行います。`options` オブジェクトのプロパティがイベントに追加されます。

- **引数:**

  - `{string} eventName` **必須**
  - `{Object} options` **オプション**

- **例:**

```js
import { mount } from 'vue2-test-utils'
import sinon from 'sinon'
import Foo from './Foo'

test('trigger demo', async () => {
  const clickHandler = sinon.stub()
  const wrapper = mount(Foo, {
    propsData: { clickHandler }
  })

  await wrapper.trigger('click')

  await wrapper.trigger('click', {
    button: 0
  })

  await wrapper.trigger('click', {
    ctrlKey: true
  })

  expect(clickHandler.called).toBe(true)
})
```

- **イベントターゲットの設定:**

`trigger` は  `Event` オブジェクトを生成して、Wrapper.element にイベントを送ります。  
`Event` オブジェクトの `target` 値を編集できません。つまり、 `target` を オプションオブジェクトにセットすることはできません。  
`target` の属性を追加するには、 `trigger` を実行する前に Wrapper.element の属性にその値をセットする必要があります。

```js
const input = wrapper.find('input')
input.element.value = 100
input.trigger('click')
```
