import immutableReactForm from '../../src/immutable-react-form';

describe('immutableReactForm', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(immutableReactForm, 'greet');
      immutableReactForm.greet();
    });

    it('should have been run once', () => {
      expect(immutableReactForm.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(immutableReactForm.greet).to.have.always.returned('hello');
    });
  });
});
