<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_authenticated_users_can_see_student_records_on_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Student::create([
            'student_id' => 'S-1001',
            'name' => 'Alice Johnson',
            'email' => 'alice@example.com',
            'phone' => '123456789',
            'address' => '123 Main Street',
        ]);

        $response = $this->get(route('dashboard'));

        $response->assertOk()
            ->assertSee('Alice Johnson')
            ->assertSee('S-1001');
    }
}
