import { defineService, Data } from '@skyslit/ark-backend';

export default defineService('assign-group-to-user', (props) => {
  const { useModel } = props.use(Data);
  const AccountModel = useModel("account");
  const MemberModel = useModel("member-assignment");
  const GroupModel = useModel("group");

  props.defineRule((props) => {
    props.allowPolicy('SUPER_ADMIN')
  });

  props.defineLogic(async (props) => {
    const { userId, groupId } = props.args.input;

    const user = await AccountModel.findOne({ _id: userId }).exec();
    if (!user) {
      throw new Error('User with this id not found');
    }

    const existingMember = await MemberModel.findOne({ userId, groupId }).exec();
    if (existingMember) {
      throw new Error('User is already a member of selected group');
    }

    const groups = await GroupModel.find({ _id: { $in: groupId } }).exec();

    await Promise.all([
      groups.forEach((group) => {
        user.groupId.push(group._id);
        group.count = group.count + 1;
        return Promise.all([user.save(), group.save()]);
      }),
      Promise.all(groupId.map((id) => {
        const member = new MemberModel({
          userId: userId,
          groupId: id
        });
        return member.save();
      }))
    ]);

    return props.success({ message: 'Groups(s) assigned' }, groups);
  });
});