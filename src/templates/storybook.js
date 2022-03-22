import { expect } from '@storybook/jest';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { within } from '@storybook/testing-library';
import COMPONENT_NAME, { COMPONENT_NAMEProps } from './COMPONENT_NAME';

export default {
  title: 'Components/COMPONENT_NAME',
  component: COMPONENT_NAME,
} as ComponentMeta<COMPONENT_NAMEProps>;

const Template: ComponentStory<COMPONENT_NAMEProps> = (args) => <COMPONENT_NAME {...args} />;

export const Default = Template.bind({});

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const component = await canvas.findByText(/COMPONENT_NAME/i);
  await expect(component).toBeInTheDocument();
};