import { expect } from '@storybook/jest';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { within } from '@storybook/testing-library';
import COMPONENT_NAME from './COMPONENT_NAME';

export default {
  title: 'Components/COMPONENT_NAME',
  component: COMPONENT_NAME,
} as ComponentMeta<typeof COMPONENT_NAME>;

const Template: ComponentStory<typeof COMPONENT_NAME> = (args) => <COMPONENT_NAME {...args} />;

export const Default = Template.bind({});

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const component = await canvas.findByText(/COMPONENT_NAME/i);
  await expect(component).toBeInTheDocument();
};