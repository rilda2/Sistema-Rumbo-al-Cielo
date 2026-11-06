import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:restaurante_app/features/familiares/data/supabase_family_repository.dart';
import 'package:restaurante_app/features/familiares/domain/familiar_entity.dart';
import 'package:restaurante_app/features/familiares/domain/family_repository.dart';

final familyRepositoryProvider = Provider<FamilyRepository>((ref) {
  return SupabaseFamilyRepository();
});

final employeeFamilyMembersProvider =
    FutureProvider<List<Familiar>>((ref) async {
  final user = ref.watch(authProvider);
  if (user == null) return [];
  final repo = ref.watch(familyRepositoryProvider);
  return repo.getFamilyMembers(user.id);
});
